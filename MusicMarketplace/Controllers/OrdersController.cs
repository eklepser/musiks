using Microsoft.AspNetCore.Mvc;
using MusicMarketplace.Services;

namespace MusicMarketplace.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        private readonly OrdersService _ordersService;
        public OrdersController(OrdersService ordersService)
        {
            _ordersService = ordersService;
        }

        [HttpGet]
        public async Task<IActionResult> GetOrders()
        {
            var orders = await _ordersService.GetAllAsync();
            return Ok(orders);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrder(int id)
        {
            var order = await _ordersService.GetByIdAsync(id);
            if (order == null) return NotFound();
            return Ok(order);
        }

        [HttpGet("byUser/{userId}")]
        public async Task<IActionResult> GetByUser(int userId)
        {
            var orders = await _ordersService.GetByUserAsync(userId);
            return Ok(orders);
        }

        [HttpGet("byUser/{userId}/detailed")]
        public async Task<IActionResult> GetOrdersWithItems(int userId)
        {
            var orders = await _ordersService.GetOrdersWithItemsAsync(userId);
            return Ok(orders);
        }

        [HttpPost]
        public async Task<IActionResult> PostOrder(OrdersService.OrderDto dto)
        {
            var order = await _ordersService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetOrder), new { id = order.order_id }, order);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutOrder(int id, OrdersService.OrderDto dto)
        {
            try
            {
                await _ordersService.UpdateAsync(id, dto);
                return NoContent();
            }
            catch (ArgumentException)
            {
                return BadRequest();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            try
            {
                await _ordersService.DeleteAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }
    }
}