public class CartDto
{
    public int product_id { get; set; }
    public string name { get; set; }
    public decimal price { get; set; }
    public int quantity { get; set; }
    public DateTime added_date { get; set; }
}