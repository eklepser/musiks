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

        public class TicketDto
        {
            public int ticket_id { get; set; }
            public int product_id { get; set; }
            public string name { get; set; }
            public decimal price { get; set; }
            public string description { get; set; }
            public int stock { get; set; }
            public int manufacturer_id { get; set; }
            public int concert_id { get; set; }
            public string seat_row { get; set; }
            public string seat_number { get; set; }
            public string price_category { get; set; }
        }

        public class TicketCreateDto
        {
            public string name { get; set; }
            public decimal price { get; set; }
            public string description { get; set; }
            public int stock { get; set; }
            public int manufacturer_id { get; set; }
            public int concert_id { get; set; }
            public string seat_row { get; set; }
            public string seat_number { get; set; }
            public string price_category { get; set; }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TicketDto>>> GetTickets()
        {
            var items = await (from t in _context.Tickets
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
            return Ok(items);
        }

        [HttpPost]
        public async Task<ActionResult<TicketDto>> PostTicket(TicketCreateDto dto)
        {
            using var tx = await _context.Database.BeginTransactionAsync();

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

            await tx.CommitAsync();

            var resultDto = new TicketDto
            {
                ticket_id = ticket.ticket_id,
                product_id = product.product_id,
                name = dto.name,
                price = dto.price,
                description = dto.description,
                stock = dto.stock,
                manufacturer_id = dto.manufacturer_id,
                concert_id = dto.concert_id,
                seat_row = dto.seat_row,
                seat_number = dto.seat_number,
                price_category = dto.price_category
            };
            return CreatedAtAction(nameof(GetTickets), new { id = ticket.ticket_id }, resultDto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutTicket(int id, TicketDto dto)
        {
            if (id != dto.ticket_id) return BadRequest();

            using var tx = await _context.Database.BeginTransactionAsync();

            var ticket = await _context.Tickets.FindAsync(id);
            if (ticket == null) return NotFound();

            var product = await _context.Products.FindAsync(ticket.product_id);
            if (product == null) return NotFound();

            product.name = dto.name;
            product.price = dto.price;
            product.description = dto.description;
            product.stock = dto.stock;
            product.manufacturer_id = dto.manufacturer_id;

            ticket.concert_id = dto.concert_id;
            ticket.seat_row = dto.seat_row;
            ticket.seat_number = dto.seat_number;
            ticket.price_category = dto.price_category;

            await _context.SaveChangesAsync();
            await tx.CommitAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTicket(int id)
        {
            var ticket = await _context.Tickets.FindAsync(id);
            if (ticket == null) return NotFound();

            var product = await _context.Products.FindAsync(ticket.product_id);
            if (product != null) _context.Products.Remove(product);
            _context.Tickets.Remove(ticket);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}