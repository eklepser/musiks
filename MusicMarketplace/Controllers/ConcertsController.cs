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

        public ConcertsController(MusicMarketplaceContext context)
        {
            _context = context;
        }

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

        [HttpPost]
        public async Task<ActionResult<Concert>> PostConcert(ConcertDto dto)
        {
            if (await _context.Concerts.AnyAsync(c => c.title == dto.title && c.venue == dto.venue && c.datetime == dto.datetime))
                return Conflict("Концерт с такими же названием, местом и датой уже существует");

            var concert = new Concert
            {
                title = dto.title,
                venue = dto.venue,
                datetime = dto.datetime
            };
            _context.Concerts.Add(concert);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetConcert), new { id = concert.concert_id }, concert);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutConcert(int id, ConcertDto dto)
        {
            var concert = await _context.Concerts.FindAsync(id);
            if (concert == null) return NotFound();

            if (await _context.Concerts.AnyAsync(c => c.title == dto.title && c.venue == dto.venue && c.datetime == dto.datetime && c.concert_id != id))
                return Conflict("Концерт с такими же названием, местом и датой уже существует");

            concert.title = dto.title;
            concert.venue = dto.venue;
            concert.datetime = dto.datetime;

            await _context.SaveChangesAsync();
            return NoContent();
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