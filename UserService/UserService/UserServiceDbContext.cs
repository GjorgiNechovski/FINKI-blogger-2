using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using UserService.Models;

namespace UserService;

public class UserServiceDbContext : IdentityDbContext<User, IdentityRole<string>, string>
{
    public UserServiceDbContext(DbContextOptions<UserServiceDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.UserName);
            entity.Property(u => u.Id).HasDefaultValue(""); 
        });

        builder.Entity<IdentityRole<string>>(entity =>
        {
            entity.HasKey(r => r.Id);
        });
    }
}