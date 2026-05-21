using Microsoft.EntityFrameworkCore;
using MusicMarketplace.DTOs;
using MusicMarketplace.Models;

namespace MusicMarketplace.Services
{
    public class ProductGenresService
    {
        private readonly MusicMarketplaceContext _context;
        public ProductGenresService(MusicMarketplaceContext context) => _context = context;

        public async Task<List<ProductGenreDto>> GetAllAsync()
        {
            return await _context.ProductGenres
                .Join(_context.Products, pg => pg.product_id, p => p.product_id, (pg, p) => new { pg, product_name = p.name })
                .Join(_context.Genres, x => x.pg.genre_id, g => g.genre_id, (x, g) => new ProductGenreDto
                {
                    product_id = x.pg.product_id,
                    genre_id = x.pg.genre_id,
                    product_name = x.product_name,
                    genre_name = g.name
                })
                .ToListAsync();
        }

        public async Task<ProductGenre> CreateAsync(ProductGenre dto)
        {
            _context.ProductGenres.Add(dto);
            await _context.SaveChangesAsync();
            return dto;
        }

        public async Task DeleteAsync(int product_id, int genre_id)
        {
            var entity = await _context.ProductGenres.FindAsync(product_id, genre_id);
            if (entity == null) throw new KeyNotFoundException($"ProductGenre with product_id={product_id}, genre_id={genre_id} not found");
            _context.ProductGenres.Remove(entity);
            await _context.SaveChangesAsync();
        }
    }
}