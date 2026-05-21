using Microsoft.EntityFrameworkCore;
using MusicMarketplace.DTOs;
using MusicMarketplace.Models;

namespace MusicMarketplace.Services
{
    public class ConcertsService
    {
        private readonly MusicMarketplaceContext _context;
        public ConcertsService(MusicMarketplaceContext context) => _context = context;

        public async Task<List<Concert>> GetAllAsync()
        {
            return await _context.Concerts.ToListAsync();
        }

        public async Task<Concert?> GetByIdAsync(int id)
        {
            return await _context.Concerts.FindAsync(id);
        }

        public async Task<List<ConcertFilterResult>> GetFilteredAsync(
            string? searchTitle, string? searchVenue, string? status, int? artistId, string? sortBy)
        {
            var now = DateTime.Now;
            var query = _context.Concerts
                .Select(c => new
                {
                    c.concert_id,
                    c.title,
                    c.venue,
                    c.datetime,
                    artistIds = _context.ArtistConcerts
                        .Where(ac => ac.concert_id == c.concert_id)
                        .Select(ac => ac.artist_id)
                        .ToList(),
                    artistNames = _context.ArtistConcerts
                        .Where(ac => ac.concert_id == c.concert_id)
                        .Join(_context.Artists,
                              ac => ac.artist_id,
                              a => a.artist_id,
                              (ac, a) => a.name)
                        .ToList()
                })
                .AsQueryable();

            if (status == "upcoming")
                query = query.Where(c => c.datetime >= now);
            else if (status == "past")
                query = query.Where(c => c.datetime < now);

            if (!string.IsNullOrEmpty(searchTitle))
                query = query.Where(c => c.title.ToLower().Contains(searchTitle.ToLower()));

            if (!string.IsNullOrEmpty(searchVenue))
                query = query.Where(c => c.venue.ToLower().Contains(searchVenue.ToLower()));

            if (artistId.HasValue)
                query = query.Where(c => c.artistIds.Contains(artistId.Value));

            var concerts = await query.ToListAsync();

            if (sortBy == "date_asc")
                concerts = concerts.OrderBy(c => c.datetime).ToList();
            else if (sortBy == "date_desc")
                concerts = concerts.OrderByDescending(c => c.datetime).ToList();
            else
                concerts = concerts.OrderBy(c => c.datetime).ToList();

            return concerts.Select(c => new ConcertFilterResult
            {
                concert_id = c.concert_id,
                title = c.title,
                venue = c.venue,
                datetime = c.datetime,
                artistNames = string.Join(", ", c.artistNames),
                artistIds = c.artistIds
            }).ToList();
        }

        public async Task<List<object>> GetArtistsForFilterAsync()
        {
            return await _context.Artists
                .OrderBy(a => a.name)
                .Select(a => new { a.artist_id, a.name })
                .ToListAsync<object>();
        }

        public async Task<Concert> CreateAsync(ConcertDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                if (await _context.Concerts.AnyAsync(c => c.title == dto.title && c.venue == dto.venue && c.datetime == dto.datetime))
                    throw new InvalidOperationException("Такой концерт уже существует");

                var concert = new Concert
                {
                    title = dto.title,
                    venue = dto.venue,
                    datetime = dto.datetime
                };
                _context.Concerts.Add(concert);
                await _context.SaveChangesAsync();

                if (dto.artistIds != null && dto.artistIds.Any())
                {
                    foreach (var artistId in dto.artistIds)
                    {
                        _context.ArtistConcerts.Add(new ArtistConcert { artist_id = artistId, concert_id = concert.concert_id });
                    }
                    await _context.SaveChangesAsync();
                }

                await transaction.CommitAsync();
                return concert;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task UpdateAsync(int id, ConcertDto dto)
        {
            if (id != dto.concert_id) throw new ArgumentException("ID mismatch");

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var concert = await _context.Concerts.FindAsync(id);
                if (concert == null) throw new KeyNotFoundException($"Concert with id {id} not found");

                if (await _context.Concerts.AnyAsync(c => c.title == dto.title && c.venue == dto.venue && c.datetime == dto.datetime && c.concert_id != id))
                    throw new InvalidOperationException("Такой концерт уже существует");

                concert.title = dto.title;
                concert.venue = dto.venue;
                concert.datetime = dto.datetime;

                var oldLinks = await _context.ArtistConcerts
                    .Where(ac => ac.concert_id == id)
                    .ToListAsync();
                _context.ArtistConcerts.RemoveRange(oldLinks);

                if (dto.artistIds != null && dto.artistIds.Any())
                {
                    foreach (var artistId in dto.artistIds)
                    {
                        _context.ArtistConcerts.Add(new ArtistConcert { artist_id = artistId, concert_id = id });
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task DeleteAsync(int id)
        {
            var concert = await _context.Concerts.FindAsync(id);
            if (concert == null) throw new KeyNotFoundException($"Concert with id {id} not found");
            _context.Concerts.Remove(concert);
            await _context.SaveChangesAsync();
        }
    }
}