namespace MusicMarketplace.Models
{
    public class AccessoryCreateWithProductDto
    {
        // Данные для Product
        public string name { get; set; }
        public decimal price { get; set; }
        public string description { get; set; }
        public int stock { get; set; }
        public int? manufacturer_id { get; set; }

        // Данные для Merch
        public string material { get; set; }
        public string color { get; set; }

        // Данные для Accessory
        public string accessory_type { get; set; }
        public decimal? weight { get; set; }
    }

    public class AccessoryUpdateDto
    {
        public int accessory_id { get; set; }
        public int merch_id { get; set; }
        public string accessory_type { get; set; }
        public decimal? weight { get; set; }
    }
}