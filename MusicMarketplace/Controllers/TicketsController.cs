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
    public class TicketsController : ControllerBase
    {
        private readonly MusicMarketplaceContext _context;

        public TicketsController(MusicMarketplaceContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TicketDto>>> GetTickets()
        {
            var tickets = await (from t in _context.Tickets
                                 join p in _context.Products on t.product_id equals p.product_id
                                 select new TicketDto
                                 {
                                     ticket_id = t.ticket_id,
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
        public async Task<ActionResult<TicketDto>> CreateTicket(TicketDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.name))
                return BadRequest("Название товара обязательно");
            if (dto.manufacturer_id == 0)
                return BadRequest("Производитель обязателен");
            if (dto.concert_id == 0)
                return BadRequest("Концерт обязателен");

            var manufacturerExists = await _context.Manufacturers.AnyAsync(m => m.manufacturer_id == dto.manufacturer_id);
            if (!manufacturerExists)
                return BadRequest("Указанный производитель не существует");

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

            dto.ticket_id = ticket.ticket_id;
            return CreatedAtAction(nameof(GetTickets), new { id = ticket.ticket_id }, dto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutTicket(int id, TicketDto dto)
        {
            if (id != dto.ticket_id) return BadRequest();

            if (string.IsNullOrWhiteSpace(dto.name))
                return BadRequest("Название товара обязательно");

            if (dto.manufacturer_id == 0)
                return BadRequest("Производитель обязателен");

            if (dto.concert_id == 0)
                return BadRequest("Концерт обязателен");

            var manufacturerExists = await _context.Manufacturers.AnyAsync(m => m.manufacturer_id == dto.manufacturer_id);
            if (!manufacturerExists)
                return BadRequest("Указанный производитель не существует");

            using var transaction = await _context.Database.BeginTransactionAsync();

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
            await transaction.CommitAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTicket(int id)
        {
            var ticket = await _context.Tickets.FindAsync(id);
            if (ticket == null) return NotFound();

            var product = await _context.Products.FindAsync(ticket.product_id);
            if (product != null)
            {
                var orderItems = _context.OrderItems.Where(oi => oi.product_id == product.product_id);
                _context.OrderItems.RemoveRange(orderItems);
                _context.Products.Remove(product);
            }
            _context.Tickets.Remove(ticket);

            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}