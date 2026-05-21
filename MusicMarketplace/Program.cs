using Microsoft.EntityFrameworkCore;
using MusicMarketplace.Middleware;
using MusicMarketplace.Models;
using MusicMarketplace.Services;

namespace MusicMarketplace
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            builder.Services.AddControllers();
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowAll", policy =>
                {
                    policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
                });
            });
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();
            builder.Services.AddDbContext<MusicMarketplaceContext>(options =>
                options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

            builder.Services.AddScoped<AccessoriesService>();
            builder.Services.AddScoped<ArtistConcertsService>();
            builder.Services.AddScoped<ArtistMerchesService>();
            builder.Services.AddScoped<ArtistsService>();
            builder.Services.AddScoped<CartsService>();
            builder.Services.AddScoped<ClothingsService>();
            builder.Services.AddScoped<ConcertsService>();
            builder.Services.AddScoped<GenresService>();
            builder.Services.AddScoped<ManufacturersService>();
            builder.Services.AddScoped<MerchesService>();
            builder.Services.AddScoped<OrderItemsService>();
            builder.Services.AddScoped<OrdersService>();
            builder.Services.AddScoped<ProductGenresService>();
            builder.Services.AddScoped<ProductsService>();
            builder.Services.AddScoped<ReviewsService>();
            builder.Services.AddScoped<TicketsService>();
            builder.Services.AddScoped<UsersService>();
            builder.Services.AddScoped<WishlistsService>();

            var app = builder.Build();

            app.UseCors("AllowAll");
            app.UseMiddleware<HtmlExtensionRewriteMiddleware>();
            app.UseDefaultFiles(); 
            app.UseStaticFiles();  

            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();
            app.UseAuthorization();
            app.MapControllers();

            app.Run();
        }
    }
}