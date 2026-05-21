namespace MusicMarketplace.Middleware
{
    public class HtmlExtensionRewriteMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IWebHostEnvironment _env;

        public HtmlExtensionRewriteMiddleware(RequestDelegate next, IWebHostEnvironment env)
        {
            _next = next;
            _env = env;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var path = context.Request.Path.Value;

            if (!string.IsNullOrEmpty(path)
                && !path.Contains('.')
                && !path.StartsWith("/api", System.StringComparison.OrdinalIgnoreCase)
                && !path.StartsWith("/swagger", System.StringComparison.OrdinalIgnoreCase))
            {
                var htmlPath = Path.Combine(_env.WebRootPath, path.TrimStart('/') + ".html");

                if (File.Exists(htmlPath))
                {
                    context.Response.ContentType = "text/html";
                    await context.Response.SendFileAsync(htmlPath);
                    return;
                }
            }

            await _next(context);
        }
    }
}