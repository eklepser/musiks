namespace MusicMarketplace.DTOs;

public class LogDto
{
    public int log_id { get; set; }
    public string table_name { get; set; }
    public int? record_id { get; set; }
    public string operation_type { get; set; }
    public string? old_data { get; set; }
    public string? new_data { get; set; }
    public DateTime changed_at { get; set; }
}