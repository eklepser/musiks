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


        [HttpGet("byUser/{userId}/detailed")]
        public async Task<ActionResult<IEnumerable<OrderWithItemsDto>>> GetOrdersWithItems(int userId)
        {
            var orders = await _context.Orders
                .Where(o => o.user_id == userId)
                .Include(o => o.user)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.product)
                .OrderByDescending(o => o.order_date)
                .ToListAsync();

            var result = orders.Select(o => new OrderWithItemsDto
            {
                order_id = o.order_id,
                user_id = o.user_id,
                user_name = o.user.full_name,
                user_login = o.user.login,
                order_date = o.order_date,
                status = o.status,
                total_amount = o.total_amount,
                items = o.OrderItems.Select(oi => new OrderItemDetailDto
                {
                    product_id = oi.product_id,
                    product_name = oi.product.name,
                    quantity = oi.quantity,
                    unit_price = oi.unit_price,
                    total_price = oi.quantity * oi.unit_price
                }).ToList()
            }).ToList();

            return Ok(result);
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