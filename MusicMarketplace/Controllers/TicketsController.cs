// TicketsController.cs
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

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TicketDto>>> GetTickets()
        {
            var tickets = await _context.Tickets
                .Include(t => t.concert)
                .Include(t => t.product)
                .Select(t => new TicketDto
                {
                    ticket_id = t.ticket_id,
                    product_id = t.product_id,
                    name = t.product.name,
                    price = t.product.price,
                    description = t.product.description,
                    stock = t.product.stock,
                    manufacturer_id = t.product.manufacturer_id,
                    concert_id = t.concert_id,
                    price_category = t.price_category,
                    quantity = t.quantity
                })
                .ToListAsync();
            return Ok(tickets);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TicketDto>> GetTicket(int id)
        {
            var ticket = await _context.Tickets
                .Include(t => t.concert)
                .Include(t => t.product)
                .Where(t => t.ticket_id == id)
                .Select(t => new TicketDto
                {
                    ticket_id = t.ticket_id,
                    product_id = t.product_id,
                    name = t.product.name,
                    price = t.product.price,
                    description = t.product.description,
                    stock = t.product.stock,
                    manufacturer_id = t.product.manufacturer_id,
                    concert_id = t.concert_id,
                    price_category = t.price_category,
                    quantity = t.quantity
                })
                .FirstOrDefaultAsync();
            if (ticket == null) return NotFound();
            return Ok(ticket);
        }

        [HttpPost]
        public async Task<ActionResult<TicketDto>> PostTicket(TicketDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
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
                    concert_id = dto.concert_id,
                    product_id = product.product_id,
                    price_category = dto.price_category,
                    quantity = dto.quantity
                };
                _context.Tickets.Add(ticket);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                var result = new TicketDto
                {
                    ticket_id = ticket.ticket_id,
                    product_id = product.product_id,
                    name = product.name,
                    price = product.price,
                    description = product.description,
                    stock = product.stock,
                    manufacturer_id = product.manufacturer_id,
                    concert_id = ticket.concert_id,
                    price_category = ticket.price_category,
                    quantity = ticket.quantity
                };
                return CreatedAtAction(nameof(GetTicket), new { id = ticket.ticket_id }, result);
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutTicket(int id, TicketDto dto)
        {
            if (id != dto.ticket_id) return BadRequest();

            var existingTicket = await _context.Tickets
                .Include(t => t.product)
                .FirstOrDefaultAsync(t => t.ticket_id == id);
            if (existingTicket == null) return NotFound();

            existingTicket.concert_id = dto.concert_id;
            existingTicket.price_category = dto.price_category;
            existingTicket.quantity = dto.quantity;

            var product = existingTicket.product;
            product.name = dto.name;
            product.price = dto.price;
            product.description = dto.description;
            product.stock = dto.stock;
            product.manufacturer_id = dto.manufacturer_id;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTicket(int id)
        {
            var ticket = await _context.Tickets
                .Include(t => t.product)
                .FirstOrDefaultAsync(t => t.ticket_id == id);
            if (ticket == null) return NotFound();
            _context.Tickets.Remove(ticket);
            _context.Products.Remove(ticket.product);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}