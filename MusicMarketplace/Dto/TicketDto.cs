namespace MusicMarketplace.Models
{
    public class TicketCreateWithProductDto
    {
        // Данные для Product
        public string name { get; set; }
        public decimal price { get; set; }
        public string description { get; set; }
        public int stock { get; set; }
        public int? manufacturer_id { get; set; }

        // Данные для Ticket
        public int concert_id { get; set; }
        public string seat_row { get; set; }
        public string seat_number { get; set; }
        public string price_category { get; set; }
    }

    public class TicketUpdateDto
    {
        public int ticket_id { get; set; }
        public int product_id { get; set; }
        public int concert_id { get; set; }
        public string seat_row { get; set; }
        public string seat_number { get; set; }
        public string price_category { get; set; }
    }
}