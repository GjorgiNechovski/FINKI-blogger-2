using Microsoft.AspNetCore.Http;

namespace UserService.Util;

public static class TokenExtractor
{
    public static string GetJwtTokenFromRequest(HttpRequest request)
    {
        var headers = request.Headers;
        string token = headers.Authorization!;
        return token.Split("Bearer ")[1];
    }
}