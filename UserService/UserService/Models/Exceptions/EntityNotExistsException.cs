using System;

namespace UserService.Models.Exceptions;

public class EntityNotExistsException : Exception
{
    public EntityNotExistsException(string? message) : base(message)
    {
    }
}