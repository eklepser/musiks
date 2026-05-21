using Microsoft.EntityFrameworkCore;
using MusicMarketplace.DTOs;
using MusicMarketplace.Models;

namespace MusicMarketplace.Services
{
    public class ArtistConcertsService
    {
        private readonly MusicMarketplaceContext _context;
        public ArtistConcertsService(MusicMarketplaceContext context) => _context = context;

        public async Task<List<ArtistConcertDto>> GetAllAsync()
        {
            var sql = "SELECT * FROM get_all_artist_concerts()";
            return await _context.Database.SqlQueryRaw<ArtistConcertDto>(sql).ToListAsync();
        }

        public async Task<ArtistConcert> CreateAsync(ArtistConcert dto)
        {
            var sql = "SELECT * FROM create_artist_concert({0}, {1})";
            return await _context.Set<ArtistConcert>().FromSqlRaw(sql, dto.artist_id, dto.concert_id).FirstOrDefaultAsync();
        }

        public async Task<bool> DeleteAsync(int artistId, int concertId)
        {
            var sql = "SELECT delete_artist_concert({0}, {1})";
            var result = await _context.Database.ExecuteSqlRawAsync(sql, artistId, concertId);
            return result > 0;
        }
    }
}