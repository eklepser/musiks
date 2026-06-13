namespace MusicMarketplace.DTOs;

public class OrderDto
{
    public int order_id { get; set; }
    public int user_id { get; set; }
    public DateTime order_date { get; set; }
    public string status { get; set; }
    public decimal total_amount { get; set; }
}

public class OrderWithItemsDto
{
    public int order_id { get; set; }
    public int user_id { get; set; }
    public string user_name { get; set; }
    public string user_login { get; set; }
    public DateTime order_date { get; set; }
    public string status { get; set; }
    public decimal total_amount { get; set; }
    public string items_json { get; set; }

    // Новые поля для скидки
    public decimal original_total { get; set; }
    public int discount_percent { get; set; }
    public decimal discount_amount { get; set; }
}

public class OrderItemDetailDto
{
    public int product_id { get; set; }
    public string product_name { get; set; }
    public int quantity { get; set; }
    public decimal unit_price { get; set; }
    public decimal total_price { get; set; }
}

public class OrderWithItemsSqlDto
{
    public int order_id { get; set; }
    public int user_id { get; set; }
    public string user_name { get; set; }
    public string user_login { get; set; }
    public DateTime order_date { get; set; }
    public string status { get; set; }
    public decimal total_amount { get; set; }
    public string items_json { get; set; }
}