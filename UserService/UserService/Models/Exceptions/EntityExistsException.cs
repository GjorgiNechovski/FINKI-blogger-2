namespace UserService.Models.Exceptions;

public class EntityExistsException : Exception
{
    public EntityExistsException(string message) : base(message)
    {
    }
}