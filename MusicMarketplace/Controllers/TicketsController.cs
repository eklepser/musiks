using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MusicMarketplace.Models;

namespace MusicMarketplace.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TicketsController : ControllerBase
    {
        private readonly MusicMarketplaceContext _context;
        public TicketsController(MusicMarketplaceContext context) => _context = context;

        public class TicketDto
        {
            public int ticket_id { get; set; }
            public int product_id { get; set; }
            public string name { get; set; }
            public decimal price { get; set; }
            public string description { get; set; }
            public int stock { get; set; }
            public int? manufacturer_id { get; set; }
            public int concert_id { get; set; }
            public string seat_row { get; set; }
            public string seat_number { get; set; }
            public string price_category { get; set; }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TicketDto>>> GetTickets()
        {
            var tickets = await (from t in _context.Tickets
                                 join p in _context.Products on t.product_id equals p.product_id
                                 select new TicketDto
                                 {
                                     ticket_id = t.ticket_id,
                                     product_id = p.product_id,
                                     name = p.name,
                                     price = p.price,
                                     description = p.description,
                                     stock = p.stock,
                                     manufacturer_id = p.manufacturer_id,
                                     concert_id = t.concert_id,
                                     seat_row = t.seat_row,
                                     seat_number = t.seat_number,
                                     price_category = t.price_category
                                 }).ToListAsync();
            return Ok(tickets);
        }

        [HttpPost]
        public async Task<ActionResult<Ticket>> PostTicket(Ticket ticket)
        {
            _context.Tickets.Add(ticket);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetTickets), new { id = ticket.ticket_id }, ticket);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutTicket(int id, Ticket ticket)
        {
            if (id != ticket.ticket_id) return BadRequest();
            _context.Entry(ticket).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTicket(int id)
        {
            var ticket = await _context.Tickets.FindAsync(id);
            if (ticket == null) return NotFound();
            _context.Tickets.Remove(ticket);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}