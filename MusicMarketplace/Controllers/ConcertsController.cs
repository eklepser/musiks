using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MusicMarketplace.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MusicMarketplace.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ConcertsController : ControllerBase
    {
        private readonly MusicMarketplaceContext _context;
        public ConcertsController(MusicMarketplaceContext context) => _context = context;

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Concert>>> GetConcerts()
        {
            return await _context.Concerts.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Concert>> GetConcert(int id)
        {
            var concert = await _context.Concerts.FindAsync(id);
            if (concert == null) return NotFound();
            return concert;
        }

        [HttpGet("filter")]
        public async Task<ActionResult<IEnumerable<object>>> GetConcertsFiltered(
            [FromQuery] string? searchTitle = null,
            [FromQuery] string? searchVenue = null,
            [FromQuery] string? status = null,
            [FromQuery] int? artistId = null,
            [FromQuery] string? sortBy = null)
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

            var result = concerts.Select(c => new
            {
                c.concert_id,
                c.title,
                c.venue,
                datetime = c.datetime,
                artistNames = string.Join(", ", c.artistNames),
                artistIds = c.artistIds
            });

            return Ok(result);
        }

        [HttpGet("filter/artists")]
        public async Task<ActionResult<IEnumerable<object>>> GetArtistsForFilter()
        {
            var artists = await _context.Artists
                .OrderBy(a => a.name)
                .Select(a => new { a.artist_id, a.name })
                .ToListAsync();
            return Ok(artists);
        }

        [HttpPost]
        public async Task<ActionResult<Concert>> PostConcert(ConcertDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                if (await _context.Concerts.AnyAsync(c => c.title == dto.title && c.venue == dto.venue && c.datetime == dto.datetime))
                    return Conflict("Такой концерт уже существует");

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
                return CreatedAtAction(nameof(GetConcert), new { id = concert.concert_id }, concert);
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutConcert(int id, ConcertDto dto)
        {
            if (id != dto.concert_id) return BadRequest();

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var concert = await _context.Concerts.FindAsync(id);
                if (concert == null) return NotFound();

                if (await _context.Concerts.AnyAsync(c => c.title == dto.title && c.venue == dto.venue && c.datetime == dto.datetime && c.concert_id != id))
                    return Conflict("Такой концерт уже существует");

                concert.title = dto.title;
                concert.venue = dto.venue;
                concert.datetime = dto.datetime;

                // Загружаем существующие связи
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
                return NoContent();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteConcert(int id)
        {
            var concert = await _context.Concerts.FindAsync(id);
            if (concert == null) return NotFound();
            _context.Concerts.Remove(concert);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}