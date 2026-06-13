namespace MusicMarketplace.DTOs;

public class CartDto
{
    public int product_id { get; set; }
    public string name { get; set; }
    public decimal price { get; set; }
    public int quantity { get; set; }
    public DateTime added_date { get; set; }
}

public class CartCreateDto
{
    public int user_id { get; set; }
    public int product_id { get; set; }
    public int quantity { get; set; }
}

public class CartFilterDto
{
    public int product_id { get; set; }
    public string name { get; set; }
    public decimal price { get; set; }
    public int quantity { get; set; }
    public DateTime added_date { get; set; }
}

public class CheckoutResultDto
{
    public int order_id { get; set; }
    public decimal original_total { get; set; }
    public int discount_percent { get; set; }
    public decimal discount_amount { get; set; }
    public decimal final_total { get; set; }
}

public class CartSummaryDto
{
    public decimal original_total { get; set; }
    public int discount_percent { get; set; }
    public decimal discount_amount { get; set; }
    public decimal final_total { get; set; }
}