// Services/ArtistConcertsService.cs
using Microsoft.EntityFrameworkCore;
using MusicMarketplace.DTOs;
using MusicMarketplace.Models;

namespace MusicMarketplace.Services;

public class ArtistConcertsService
{
    private readonly MusicMarketplaceContext _context;

    public ArtistConcertsService(MusicMarketplaceContext context)
    {
        _context = context;
    }

    public async Task<List<ArtistConcertDto>> GetAllAsync()
    {
        var sql = "SELECT * FROM get_all_artist_concerts()";
        return await _context.Database.SqlQueryRaw<ArtistConcertDto>(sql).ToListAsync();
    }

    public async Task<List<ArtistConcertDto>> GetByConcertAsync(int concertId)
    {
        var all = await GetAllAsync();
        return all.Where(ac => ac.concert_id == concertId).ToList();
    }

    public async Task<List<ArtistConcertDto>> GetByArtistAsync(int artistId)
    {
        var all = await GetAllAsync();
        return all.Where(ac => ac.artist_id == artistId).ToList();
    }

    public async Task<ArtistConcertDto> CreateAsync(int artistId, int concertId)
    {
        var sql = "SELECT * FROM create_artist_concert({0}, {1})";
        var result = await _context.Database.SqlQueryRaw<ArtistConcertDto>(sql, artistId, concertId)
            .FirstOrDefaultAsync();
        if (result == null)
            throw new InvalidOperationException("Не удалось создать связь исполнителя и концерта");
        return result;
    }

    public async Task<bool> DeleteAsync(int artistId, int concertId)
    {
        var sql = "SELECT delete_artist_concert({0}, {1})";
        var result = await _context.Database.ExecuteSqlRawAsync(sql, artistId, concertId);
        return result > 0;
    }
}