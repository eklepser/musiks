using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
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

        public TicketsController(MusicMarketplaceContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Ticket>>> GetTickets()
        {
            return await _context.Tickets.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Ticket>> GetTicket(int id)
        {
            var ticket = await _context.Tickets.FindAsync(id);
            if (ticket == null) return NotFound();
            return ticket;
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutTicket(int id, TicketUpdateDto dto)
        {
            if (id != dto.ticket_id) return BadRequest();

            var ticket = await _context.Tickets.FindAsync(id);
            if (ticket == null) return NotFound();

            ticket.product_id = dto.product_id;
            ticket.concert_id = dto.concert_id;
            ticket.seat_row = dto.seat_row;
            ticket.seat_number = dto.seat_number;
            ticket.price_category = dto.price_category;

            _context.Entry(ticket).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost]
        public async Task<ActionResult<Ticket>> PostTicket(TicketCreateWithProductDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            var product = new Product
            {
                name = dto.name,
                price = dto.price,
                description = dto.description,
                stock = dto.stock,
                manufacturer_id = dto.manufacturer_id
            };
            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            var ticket = new Ticket
            {
                product_id = product.product_id,
                concert_id = dto.concert_id,
                seat_row = dto.seat_row,
                seat_number = dto.seat_number,
                price_category = dto.price_category
            };
            _context.Tickets.Add(ticket);
            await _context.SaveChangesAsync();

            await transaction.CommitAsync();

            return CreatedAtAction(nameof(GetTicket), new { id = ticket.ticket_id }, ticket);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTicket(int id)
        {
            var ticket = await _context.Tickets.FindAsync(id);
            if (ticket == null) return NotFound();

            var product = await _context.Products.FindAsync(ticket.product_id);
            _context.Tickets.Remove(ticket);
            if (product != null) _context.Products.Remove(product);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}