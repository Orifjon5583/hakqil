using Robbit.Agent.Services;

HostApplicationBuilder builder = Host.CreateApplicationBuilder(args);
builder.Services.AddWindowsService(options => options.ServiceName = "Robbit Monitor Agent");
builder.Services.Configure<RobbitOptions>(builder.Configuration.GetSection("Robbit"));
builder.Services.AddHttpClient<RobbitApiClient>();
builder.Services.AddSingleton<DeviceInfoService>();
builder.Services.AddSingleton<CommandExecutor>();
builder.Services.AddHostedService<Worker>();

IHost host = builder.Build();
host.Run();

