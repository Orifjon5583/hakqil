using System.Drawing;
using System.Drawing.Imaging;
using System.Diagnostics;
using System.Security.Cryptography;
using System.Runtime.InteropServices;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text;
using System.Windows.Forms;

namespace Robbit.Agent.Desktop;

internal static class Program
{
    [STAThread]
    private static void Main()
    {
        ApplicationConfiguration.Initialize();
        using var context = new RobbitDesktopContext();
        Application.Run(context);
    }
}

internal sealed class RobbitDesktopContext : ApplicationContext
{
    private readonly System.Windows.Forms.Timer _timer;
    private readonly string _commandPath;
    private readonly string _lockStatePath;
    private readonly string _statusPath;
    private DateTime _lastWriteTimeUtc;
    private readonly List<LockForm> _lockForms = new();

    public RobbitDesktopContext()
    {
        string directory = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData), "RobbitMonitor");
        Directory.CreateDirectory(directory);
        _commandPath = Path.Combine(directory, "desktop-command.json");
        _lockStatePath = Path.Combine(directory, "lock-state.json");
        _statusPath = Path.Combine(directory, "desktop-status.json");

        _timer = new System.Windows.Forms.Timer { Interval = 1000 };
        _timer.Tick += (_, _) =>
        {
            WriteDesktopStatus();
            CheckCommand();
        };
        _timer.Start();

        RestoreLockState();
    }

    private void WriteDesktopStatus()
    {
        try
        {
            DesktopStatus status = ActiveWindowReader.Read();
            File.WriteAllText(_statusPath, JsonSerializer.Serialize(status));
        }
        catch
        {
        }
    }

    private void CheckCommand()
    {
        if (!File.Exists(_commandPath)) return;

        DateTime writeTime = File.GetLastWriteTimeUtc(_commandPath);
        if (writeTime == _lastWriteTimeUtc) return;
        _lastWriteTimeUtc = writeTime;

        DesktopCommand? command;
        try
        {
            string json = File.ReadAllText(_commandPath);
            command = JsonSerializer.Deserialize<DesktopCommand>(json);
        }
        catch
        {
            return;
        }

        if (command is null) return;

        switch (command.Action?.ToLowerInvariant())
        {
            case "lock":
                SaveLockState(command.Message, command.EmergencyUnlockPasswordHash);
                ShowLock(command.Message, command.EmergencyUnlockPasswordHash);
                break;
            case "unlock":
                ClearLockState();
                UnlockAll();
                break;
            case "message":
                MessageBox.Show(command.Message ?? "Admin xabari.", "Robbit Monitor", MessageBoxButtons.OK, MessageBoxIcon.Information);
                break;
            case "screenshot":
                CaptureScreenshot(command.CommandId);
                break;
        }

        TryDeleteCommandFile();
    }

    private void RestoreLockState()
    {
        if (!File.Exists(_lockStatePath)) return;

        try
        {
            string json = File.ReadAllText(_lockStatePath);
            DesktopLockState? state = JsonSerializer.Deserialize<DesktopLockState>(json);
            if (state is not null)
            {
                ShowLock(state.Message, state.EmergencyUnlockPasswordHash);
            }
        }
        catch
        {
        }
    }

    private void SaveLockState(string? message, string? passwordHash)
    {
        try
        {
            var state = new DesktopLockState(message, passwordHash, DateTimeOffset.UtcNow);
            File.WriteAllText(_lockStatePath, JsonSerializer.Serialize(state));
        }
        catch
        {
        }
    }

    private void ClearLockState()
    {
        try
        {
            if (File.Exists(_lockStatePath)) File.Delete(_lockStatePath);
        }
        catch
        {
        }
    }

    private void TryDeleteCommandFile()
    {
        try
        {
            if (File.Exists(_commandPath)) File.Delete(_commandPath);
        }
        catch
        {
        }
    }

    private void ShowLock(string? message, string? passwordHash)
    {
        if (_lockForms.Count > 0) return;

        foreach (Screen screen in Screen.AllScreens)
        {
            var form = new LockForm(screen, message, passwordHash, UnlockWithPassword);
            _lockForms.Add(form);
            form.Show();
        }
    }

    private void UnlockWithPassword()
    {
        ClearLockState();
        UnlockAll();
    }

    private void UnlockAll()
    {
        foreach (LockForm form in _lockForms.ToArray())
        {
            form.AllowClose();
            form.Close();
        }

        _lockForms.Clear();
    }

    private void CaptureScreenshot(Guid? commandId)
    {
        if (commandId is null) return;

        string resultPath = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData),
            "RobbitMonitor",
            $"screenshot-result-{commandId}.json"
        );

        try
        {
            Rectangle bounds = SystemInformation.VirtualScreen;
            using var bitmap = new Bitmap(bounds.Width, bounds.Height);
            using (Graphics graphics = Graphics.FromImage(bitmap))
            {
                graphics.CopyFromScreen(bounds.Left, bounds.Top, 0, 0, bounds.Size);
            }

            using var stream = new MemoryStream();
            ImageCodecInfo encoder = ImageCodecInfo.GetImageEncoders().First(codec => codec.MimeType == "image/jpeg");
            using var parameters = new EncoderParameters(1);
            parameters.Param[0] = new EncoderParameter(System.Drawing.Imaging.Encoder.Quality, 75L);
            bitmap.Save(stream, encoder, parameters);

            string dataUrl = $"data:image/jpeg;base64,{Convert.ToBase64String(stream.ToArray())}";
            var result = new
            {
                dataUrl,
                mimeType = "image/jpeg",
                fileSize = stream.Length,
                capturedAtUtc = DateTimeOffset.UtcNow
            };
            File.WriteAllText(resultPath, JsonSerializer.Serialize(result));
        }
        catch (Exception ex)
        {
            var result = new
            {
                mimeType = "image/jpeg",
                fileSize = 0,
                errorMessage = ex.Message,
                capturedAtUtc = DateTimeOffset.UtcNow
            };
            File.WriteAllText(resultPath, JsonSerializer.Serialize(result));
        }
    }

    protected override void Dispose(bool disposing)
    {
        if (disposing)
        {
            _timer.Stop();
            _timer.Dispose();
        }

        base.Dispose(disposing);
    }
}

internal sealed class LockForm : Form
{
    private readonly string _password;
    private readonly Action _unlock;
    private bool _allowClose;
    private readonly TextBox _passwordBox = new();
    private readonly Label _errorLabel = new();

    public LockForm(Screen screen, string? message, string? passwordHash, Action unlock)
    {
        _password = passwordHash ?? "";
        _unlock = unlock;

        StartPosition = FormStartPosition.Manual;
        Bounds = screen.Bounds;
        WindowState = FormWindowState.Maximized;
        FormBorderStyle = FormBorderStyle.None;
        TopMost = true;
        BackColor = Color.FromArgb(15, 23, 42);
        ForeColor = Color.White;
        KeyPreview = true;
        ShowInTaskbar = false;

        var panel = new TableLayoutPanel
        {
            Dock = DockStyle.Fill,
            ColumnCount = 1,
            RowCount = 7,
            Padding = new Padding(40)
        };

        panel.RowStyles.Add(new RowStyle(SizeType.Percent, 24));
        panel.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        panel.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        panel.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        panel.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        panel.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        panel.RowStyles.Add(new RowStyle(SizeType.Percent, 76));

        var title = new Label
        {
            Text = "Kompyuter vaqtincha bloklandi",
            AutoSize = true,
            Anchor = AnchorStyles.None,
            Font = new Font("Segoe UI", 30, FontStyle.Bold),
            TextAlign = ContentAlignment.MiddleCenter
        };

        var body = new Label
        {
            Text = string.IsNullOrWhiteSpace(message) ? "Dars jarayoni uchun admin tomonidan bloklandi." : message,
            AutoSize = true,
            MaximumSize = new Size(900, 0),
            Anchor = AnchorStyles.None,
            Font = new Font("Segoe UI", 14),
            TextAlign = ContentAlignment.MiddleCenter
        };

        var help = new Label
        {
            Text = "Parolni kiriting yoki adminga murojaat qiling.",
            AutoSize = true,
            Anchor = AnchorStyles.None,
            Font = new Font("Segoe UI", 13),
            ForeColor = Color.FromArgb(203, 213, 225)
        };

        _passwordBox.Width = 360;
        _passwordBox.Anchor = AnchorStyles.None;
        _passwordBox.Font = new Font("Segoe UI", 14);
        _passwordBox.UseSystemPasswordChar = true;
        _passwordBox.KeyDown += (_, e) =>
        {
            if (e.KeyCode == Keys.Enter) TryUnlock();
        };

        var button = new Button
        {
            Text = "Ochish",
            Width = 160,
            Height = 42,
            Anchor = AnchorStyles.None,
            Font = new Font("Segoe UI", 12, FontStyle.Bold)
        };
        button.Click += (_, _) => TryUnlock();

        _errorLabel.AutoSize = true;
        _errorLabel.Anchor = AnchorStyles.None;
        _errorLabel.Font = new Font("Segoe UI", 11);
        _errorLabel.ForeColor = Color.FromArgb(248, 113, 113);

        panel.Controls.Add(new Panel(), 0, 0);
        panel.Controls.Add(title, 0, 1);
        panel.Controls.Add(body, 0, 2);
        panel.Controls.Add(help, 0, 3);
        panel.Controls.Add(_passwordBox, 0, 4);
        panel.Controls.Add(button, 0, 5);
        panel.Controls.Add(_errorLabel, 0, 6);
        Controls.Add(panel);
    }

    public void AllowClose()
    {
        _allowClose = true;
    }

    protected override void OnShown(EventArgs e)
    {
        base.OnShown(e);
        Activate();
        _passwordBox.Focus();
    }

    protected override void OnFormClosing(FormClosingEventArgs e)
    {
        if (!_allowClose)
        {
            e.Cancel = true;
            return;
        }

        base.OnFormClosing(e);
    }

    private void TryUnlock()
    {
        if (!string.IsNullOrEmpty(_password) && Sha256(_passwordBox.Text) == _password)
        {
            _unlock();
            return;
        }

        _passwordBox.Clear();
        _errorLabel.Text = "Parol noto'g'ri. Admin bilan bog'laning.";
    }

    private static string Sha256(string value)
    {
        byte[] bytes = SHA256.HashData(Encoding.UTF8.GetBytes(value));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }
}

internal sealed record DesktopCommand(
    [property: JsonPropertyName("commandId")] Guid? CommandId,
    [property: JsonPropertyName("action")] string? Action,
    [property: JsonPropertyName("message")] string? Message,
    [property: JsonPropertyName("emergencyUnlockPasswordHash")] string? EmergencyUnlockPasswordHash,
    [property: JsonPropertyName("createdAtUtc")] DateTimeOffset CreatedAtUtc
);

internal sealed record DesktopLockState(
    [property: JsonPropertyName("message")] string? Message,
    [property: JsonPropertyName("emergencyUnlockPasswordHash")] string? EmergencyUnlockPasswordHash,
    [property: JsonPropertyName("createdAtUtc")] DateTimeOffset CreatedAtUtc
);

internal sealed record DesktopStatus(
    [property: JsonPropertyName("activeWindowTitle")] string? ActiveWindowTitle,
    [property: JsonPropertyName("activeProcessName")] string? ActiveProcessName,
    [property: JsonPropertyName("updatedAtUtc")] DateTimeOffset UpdatedAtUtc
);

internal static class ActiveWindowReader
{
    public static DesktopStatus Read()
    {
        IntPtr handle = GetForegroundWindow();
        string? title = null;
        string? processName = null;

        if (handle != IntPtr.Zero)
        {
            int length = GetWindowTextLength(handle);
            if (length > 0)
            {
                var builder = new StringBuilder(length + 1);
                GetWindowText(handle, builder, builder.Capacity);
                title = builder.ToString();
            }

            GetWindowThreadProcessId(handle, out uint processId);
            if (processId > 0)
            {
                try
                {
                    processName = Process.GetProcessById((int)processId).ProcessName;
                }
                catch
                {
                }
            }
        }

        return new DesktopStatus(title, processName, DateTimeOffset.UtcNow);
    }

    [DllImport("user32.dll")]
    private static extern IntPtr GetForegroundWindow();

    [DllImport("user32.dll", SetLastError = true, CharSet = CharSet.Unicode)]
    private static extern int GetWindowText(IntPtr hWnd, StringBuilder text, int count);

    [DllImport("user32.dll", SetLastError = true)]
    private static extern int GetWindowTextLength(IntPtr hWnd);

    [DllImport("user32.dll", SetLastError = true)]
    private static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint processId);
}
