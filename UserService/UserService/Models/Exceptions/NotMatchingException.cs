namespace UserService.Models.Exceptions;

public class NotMatchingException : Exception
{
    public NotMatchingException(string message) : base(message)
    {
    }
}