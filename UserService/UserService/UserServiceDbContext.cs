using UserService.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace UserService;

public class UserServiceDbContext : IdentityDbContext<User>
{
    public UserServiceDbContext(DbContextOptions<UserServiceDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
}
