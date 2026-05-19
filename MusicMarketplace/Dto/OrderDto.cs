public class OrderDto
{
    public int order_id { get; set; }
    public int user_id { get; set; }
    public DateTime order_date { get; set; }
    public string status { get; set; }
    public decimal total_amount { get; set; }
}