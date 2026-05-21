using Microsoft.EntityFrameworkCore;
using MusicMarketplace.DTOs;
using MusicMarketplace.Models;

namespace MusicMarketplace.Services
{
    public class TicketsService
    {
        private readonly MusicMarketplaceContext _context;
        public TicketsService(MusicMarketplaceContext context) => _context = context;

        public async Task<List<TicketDto>> GetAllAsync()
        {
            return await _context.Tickets
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
        }

        public async Task<TicketDto?> GetByIdAsync(int id)
        {
            return await _context.Tickets
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
        }

        public async Task<TicketDto> CreateAsync(TicketDto dto)
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

                return new TicketDto
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
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task UpdateAsync(int id, TicketDto dto)
        {
            if (id != dto.ticket_id) throw new ArgumentException("ID mismatch");

            var existingTicket = await _context.Tickets
                .Include(t => t.product)
                .FirstOrDefaultAsync(t => t.ticket_id == id);
            if (existingTicket == null) throw new KeyNotFoundException($"Ticket with id {id} not found");

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
        }

        public async Task DeleteAsync(int id)
        {
            var ticket = await _context.Tickets
                .Include(t => t.product)
                .FirstOrDefaultAsync(t => t.ticket_id == id);
            if (ticket == null) throw new KeyNotFoundException($"Ticket with id {id} not found");

            _context.Tickets.Remove(ticket);
            _context.Products.Remove(ticket.product);
            await _context.SaveChangesAsync();
        }
    }
}