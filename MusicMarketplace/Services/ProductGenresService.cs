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

        public async Task<ProductGenre> CreateAsync(ProductGenre dto)
        {
            var sql = "SELECT * FROM create_product_genre({0}, {1})";
            return await _context.Database.SqlQueryRaw<ProductGenre>(
                sql,
                dto.product_id,
                dto.genre_id
            ).FirstOrDefaultAsync();
        }

        public async Task<bool> DeleteAsync(int product_id, int genre_id)
        {
            var sql = "SELECT delete_product_genre({0}, {1})";
            var result = await _context.Database.ExecuteSqlRawAsync(sql, product_id, genre_id);
            return result > 0;
        }
    }
}