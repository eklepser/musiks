using Microsoft.EntityFrameworkCore;
using MusicMarketplace.DTOs;
using MusicMarketplace.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MusicMarketplace.Services
{
    public class ArtistConcertsService
    {
        private readonly MusicMarketplaceContext _context;
        public ArtistConcertsService(MusicMarketplaceContext context) => _context = context;

        public async Task<List<ArtistConcertDto>> GetAllAsync()
        {
            var data = await _context.ArtistConcerts
                .Join(_context.Artists, ac => ac.artist_id, a => a.artist_id, (ac, a) => new { ac, artist_name = a.name })
                .Join(_context.Concerts, x => x.ac.concert_id, c => c.concert_id, (x, c) => new ArtistConcertDto
                {
                    artist_id = x.ac.artist_id,
                    concert_id = x.ac.concert_id,
                    artist_name = x.artist_name,
                    concert_title = c.title
                })
                .ToListAsync();
            return data;
        }

        public async Task<ArtistConcert> CreateAsync(ArtistConcert dto)
        {
            _context.ArtistConcerts.Add(dto);
            await _context.SaveChangesAsync();
            return dto;
        }

        public async Task<bool> DeleteAsync(int artistId, int concertId)
        {
            var entity = await _context.ArtistConcerts.FindAsync(artistId, concertId);
            if (entity == null) return false;
            _context.ArtistConcerts.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}