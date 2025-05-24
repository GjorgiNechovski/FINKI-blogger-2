using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using UserService;
using UserService.Models;
using UserService.Services;
using UserService.Services.Implementation;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddSwaggerGen();

builder.Configuration.AddJsonFile("./appsettings.json", optional: true, reloadOnChange: true);

builder.Services.AddDbContext<UserServiceDbContext>(
    optionsBuilder => optionsBuilder.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddControllers().AddJsonOptions(options => options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles);

builder.Services.AddIdentityCore<User>(options => { options.User.RequireUniqueEmail = true; })
    .AddEntityFrameworkStores<UserServiceDbContext>()
    .AddDefaultTokenProviders();

builder.Services.AddTransient<IAuthenticationService, AuthenticationService>();
builder.Services.AddTransient<IJwtTokenService, JwtTokenService>();

builder.Services.AddAuthentication("Bearer")
    .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new()
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
                        builder.Configuration["Authentication:SecretForKey"] ?? string.Empty
                    )
                )
            };
        }
    );

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