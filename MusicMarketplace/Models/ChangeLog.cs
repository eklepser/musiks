using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MusicMarketplace.Models;

[Table("ChangeLog")]
public class ChangeLog
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int log_id { get; set; }

    public string table_name { get; set; }

    public int? record_id { get; set; }

    public string operation_type { get; set; }

    public string? old_data { get; set; }

    public string? new_data { get; set; }

    public DateTime changed_at { get; set; }
}