using Microsoft.AspNetCore.Mvc;
using MusicMarketplace.DTOs;
using MusicMarketplace.Services;

namespace MusicMarketplace.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        private readonly OrdersService _ordersService;
        public OrdersController(OrdersService ordersService) => _ordersService = ordersService;

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
            if (order == null) return NotFound(new { message = $"Заказ с ID {id} не найден" });
            return Ok(order);
        }

        [HttpGet("byUser/{userId}")]
        public async Task<IActionResult> GetByUser(int userId)
        {
            var orders = await _ordersService.GetByUserAsync(userId);
            return Ok(orders);
        }

        [HttpGet("byUser/{userId}/detailed")]
        public async Task<IActionResult> GetOrdersWithItems(int userId,
            [FromQuery] string? status = null,
            [FromQuery] DateTime? dateFrom = null,
            [FromQuery] DateTime? dateTo = null,
            [FromQuery] string? sortBy = null)
        {
            var orders = await _ordersService.GetFilteredOrdersWithItemsAsync(userId, status, dateFrom, dateTo, sortBy);
            return Ok(orders);
        }

        [HttpPost]
        public async Task<IActionResult> PostOrder(OrderDto dto)
        {
            try
            {
                var order = await _ordersService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetOrder), new { id = order.order_id }, order);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutOrder(int id, OrderDto dto)
        {
            try
            {
                await _ordersService.UpdateAsync(id, dto);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
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
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpPut("{id}/complete")]
        public async Task<IActionResult> CompleteOrder(int id)
        {
            var success = await _ordersService.CompleteAsync(id);
            if (!success) return BadRequest(new { message = "Заказ не может быть завершён" });
            return Ok();
        }

        [HttpPut("{id}/cancel")]
        public async Task<IActionResult> CancelOrder(int id)
        {
            var success = await _ordersService.CancelAsync(id);
            if (!success) return BadRequest(new { message = "Заказ не может быть отменён" });
            return Ok();
        }
    }
}