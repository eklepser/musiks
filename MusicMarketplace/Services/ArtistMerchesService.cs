using Microsoft.EntityFrameworkCore;
using MusicMarketplace.DTOs;
using MusicMarketplace.Models;

namespace MusicMarketplace.Services
{
    public class ArtistMerchesService
    {
        private readonly MusicMarketplaceContext _context;
        public ArtistMerchesService(MusicMarketplaceContext context) => _context = context;

        public async Task<List<ArtistMerchDto>> GetAllAsync()
        {
            var sql = "SELECT * FROM get_all_artist_merches()";
            return await _context.Database.SqlQueryRaw<ArtistMerchDto>(sql).ToListAsync();
        }

        public async Task<List<ArtistMerchDto>> GetByMerchAsync(int merchId)
        {
            var sql = "SELECT * FROM get_artist_merch_by_merch({0})";
            return await _context.Database.SqlQueryRaw<ArtistMerchDto>(sql, merchId).ToListAsync();
        }

        public async Task<ArtistMerch> CreateAsync(ArtistMerch dto)
        {
            var sql = "SELECT * FROM create_artist_merch({0}, {1})";
            return await _context.Set<ArtistMerch>().FromSqlRaw(sql, dto.artist_id, dto.merch_id).FirstOrDefaultAsync();
        }

        public async Task<bool> DeleteAsync(int artistId, int merchId)
        {
            var sql = "SELECT delete_artist_merch({0}, {1})";
            var result = await _context.Database.ExecuteSqlRawAsync(sql, artistId, merchId);
            return result > 0;
        }
    }
}