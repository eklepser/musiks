using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MusicMarketplace.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MusicMarketplace.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ArtistsController : ControllerBase
    {
        private readonly MusicMarketplaceContext _context;
        public ArtistsController(MusicMarketplaceContext context) => _context = context;

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Artist>>> GetArtists() =>
            await _context.Artists.ToListAsync();

        [HttpGet("{id}")]
        public async Task<ActionResult<Artist>> GetArtist(int id)
        {
            var artist = await _context.Artists.FindAsync(id);
            return artist == null ? NotFound() : artist;
        }

        [HttpPost]
        public async Task<ActionResult<Artist>> PostArtist(ArtistDto dto)
        {
            if (await _context.Artists.AnyAsync(a => a.name == dto.name))
                return Conflict("Исполнитель с таким именем уже существует");

            var artist = new Artist
            {
                name = dto.name,
                country = dto.country,
                debut_year = dto.debut_year,
                language = dto.language
            };
            _context.Artists.Add(artist);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetArtist), new { id = artist.artist_id }, artist);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutArtist(int id, ArtistDto dto)
        {
            if (id != dto.artist_id) return BadRequest();

            var artist = await _context.Artists.FindAsync(id);
            if (artist == null) return NotFound();

            if (await _context.Artists.AnyAsync(a => a.name == dto.name && a.artist_id != id))
                return Conflict("Исполнитель с таким именем уже существует");

            artist.name = dto.name;
            artist.country = dto.country;
            artist.debut_year = dto.debut_year;
            artist.language = dto.language;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteArtist(int id)
        {
            var artist = await _context.Artists.FindAsync(id);
            if (artist == null) return NotFound();
            _context.Artists.Remove(artist);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}