using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MusicMarketplace.Models;

namespace MusicMarketplace.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        private readonly MusicMarketplaceContext _context;
        public OrdersController(MusicMarketplaceContext context) => _context = context;

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Order>>> GetOrders()
        {
            return await _context.Orders.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Order>> GetOrder(int id)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null) return NotFound();
            return order;
        }

        [HttpGet("byUser/{userId}")]
        public async Task<ActionResult<IEnumerable<OrderDto>>> GetByUser(int userId)
        {
            var orders = await _context.Orders
                .Where(o => o.user_id == userId)
                .OrderByDescending(o => o.order_date)
                .Select(o => new OrderDto
                {
                    order_id = o.order_id,
                    order_date = o.order_date,
                    status = o.status,
                    total_amount = o.total_amount
                })
                .ToListAsync();
            return Ok(orders);
        }

        [HttpPost]
        public async Task<ActionResult<Order>> PostOrder(OrderDto dto)
        {
            var order = new Order
            {
                user_id = dto.user_id,
                order_date = dto.order_date,
                status = dto.status,
                total_amount = dto.total_amount
            };
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetOrder), new { id = order.order_id }, order);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutOrder(int id, OrderDto dto)
        {
            if (id != dto.order_id) return BadRequest();

            var order = await _context.Orders.FindAsync(id);
            if (order == null) return NotFound();

            order.user_id = dto.user_id;
            order.order_date = dto.order_date;
            order.status = dto.status;
            order.total_amount = dto.total_amount;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null) return NotFound();
            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}