using Microsoft.EntityFrameworkCore;
using MusicMarketplace.DTOs;
using MusicMarketplace.Models;

namespace MusicMarketplace.Services
{
    public class MerchGenresService
    {
        private readonly MusicMarketplaceContext _context;
        public MerchGenresService(MusicMarketplaceContext context) => _context = context;

        public async Task<List<MerchGenreDto>> GetAllAsync()
        {
            var sql = "SELECT * FROM get_all_merch_genres()";
            return await _context.Database.SqlQueryRaw<MerchGenreDto>(sql).ToListAsync();
        }

        public async Task<List<MerchGenre>> GetByMerchAsync(int merchId)
        {
            var sql = "SELECT * FROM get_merch_genres_by_merch({0})";
            return await _context.Database.SqlQueryRaw<MerchGenre>(sql, merchId).ToListAsync();
        }

        public async Task<MerchGenre> CreateAsync(MerchGenre dto)
        {
            var sql = "SELECT * FROM create_merch_genre({0}, {1})";
            return await _context.Database.SqlQueryRaw<MerchGenre>(
                sql,
                dto.merch_id,
                dto.genre_id
            ).FirstOrDefaultAsync();
        }

        public async Task<bool> DeleteAsync(int merchId, int genreId)
        {
            var sql = "SELECT delete_merch_genre({0}, {1})";
            var result = await _context.Database.ExecuteSqlRawAsync(sql, merchId, genreId);
            return result > 0;
        }
    }
}