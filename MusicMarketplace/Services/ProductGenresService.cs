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
            var sql = "SELECT * FROM get_all_product_genres()";
            return await _context.Database.SqlQueryRaw<ProductGenreDto>(sql).ToListAsync();
        }

        public async Task<List<ProductGenre>> GetByProductAsync(int productId)
        {
            return await _context.ProductGenres.Where(pg => pg.product_id == productId).ToListAsync();
        }

        public async Task<ProductGenre> CreateAsync(ProductGenre dto)
        {
            var exists = await _context.ProductGenres.AnyAsync(pg => pg.product_id == dto.product_id && pg.genre_id == dto.genre_id);
            if (exists)
                throw new InvalidOperationException("Связь между товаром и жанром уже существует");

            var sql = "SELECT * FROM create_product_genre({0}, {1})";
            return await _context.Database.SqlQueryRaw<ProductGenre>(
                sql,
                dto.product_id,
                dto.genre_id
            ).FirstOrDefaultAsync();
        }

        public async Task<bool> DeleteAsync(int productId, int genreId)
        {
            var exists = await _context.ProductGenres.AnyAsync(pg => pg.product_id == productId && pg.genre_id == genreId);
            if (!exists)
                throw new KeyNotFoundException($"Связь между товаром {productId} и жанром {genreId} не найдена");

            var sql = "SELECT delete_product_genre({0}, {1})";
            var result = await _context.Database.ExecuteSqlRawAsync(sql, productId, genreId);
            return result > 0;
        }

        public async Task UpdateProductGenresAsync(int productId, List<int> genreIds)
        {
            var existing = await _context.ProductGenres.Where(pg => pg.product_id == productId).ToListAsync();
            var toDelete = existing.Where(e => !genreIds.Contains(e.genre_id)).ToList();
            var toAdd = genreIds.Where(g => !existing.Any(e => e.genre_id == g)).ToList();

            foreach (var item in toDelete)
            {
                await DeleteAsync(item.product_id, item.genre_id);
            }

            foreach (var genreId in toAdd)
            {
                await CreateAsync(new ProductGenre { product_id = productId, genre_id = genreId });
            }
        }
    }
}