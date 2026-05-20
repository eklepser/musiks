public class OrderItemDto
{
    public int product_id { get; set; }
    public string product_name { get; set; }
    public int quantity { get; set; }
    public decimal unit_price { get; set; }
    public decimal total_price { get; set; }
}