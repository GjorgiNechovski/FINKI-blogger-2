using System;
using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using UserService;
using UserService.Models;
using UserService.Services;
using UserService.Services.Implementation;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenTelemetry()
    .ConfigureResource(resource => resource.AddService("user-service"))
    .WithTracing(tracing => tracing
        .AddAspNetCoreInstrumentation()
        .AddHttpClientInstrumentation()
        .AddSource("user-service")
        .AddOtlpExporter());

builder.Services.AddControllers();

builder.Services.AddSwaggerGen();

builder.Configuration.AddJsonFile("./appsettings.json", optional: true, reloadOnChange: true);

builder.Services.AddDbContext<UserServiceDbContext>(
    // EnableRetryOnFailure retries transient failures (incl. a dropped connection
    // after the database restarts/fails over) on a fresh connection, instead of
    // surfacing them as 500s -- the EF Core equivalent of pool_pre_ping.
    optionsBuilder => optionsBuilder.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        npgsql => npgsql.EnableRetryOnFailure()));

builder.Services.AddControllers().AddJsonOptions(options => 
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles);

builder.Services.AddIdentityCore<User>(options => 
{
    options.User.RequireUniqueEmail = true;
    options.SignIn.RequireConfirmedAccount = false;
})
.AddRoles<IdentityRole<string>>() 
.AddEntityFrameworkStores<UserServiceDbContext>()
.AddDefaultTokenProviders();

builder.Services.AddTransient<IAuthenticationService, AuthenticationService>();
builder.Services.AddTransient<IJwtTokenService, JwtTokenService>();

builder.Services.AddAuthentication("Bearer")
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Authentication:Issuer"],
            ValidAudience = builder.Configuration["Authentication:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey
            (
                Encoding.ASCII.GetBytes
                (
                    builder.Configuration["Authentication:SecretForKey"] ?? throw new InvalidOperationException("SecretForKey is not configured")
                )
            )
        };
    });

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", cors =>
        cors.WithOrigins("http://localhost:4200")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials());
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();