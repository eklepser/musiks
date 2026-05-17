namespace MusicMarketplace.Models
{
    // Для создания одежды вместе с товаром и мерчем
    public class ClothingCreateWithProductDto
    {
        // Данные для Product (товар)
        public string name { get; set; }
        public decimal price { get; set; }
        public string description { get; set; }
        public int stock { get; set; }
        public int? manufacturer_id { get; set; }

        // Данные для Merch (общий мерч)
        public string material { get; set; }
        public string color { get; set; }

        // Данные для Clothing (специфика одежды)
        public string size { get; set; }
        public string gender { get; set; }
    }

    // Для обновления одежды (предполагаем, что product и merch уже существуют)
    public class ClothingUpdateDto
    {
        public int clothing_id { get; set; }
        public int merch_id { get; set; }
        public string size { get; set; }
        public string gender { get; set; }
    }
}