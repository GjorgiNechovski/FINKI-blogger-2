using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace UserService.Models;

public class User : IdentityUser<string> 
{
    [Key] 
    public override string UserName { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
}