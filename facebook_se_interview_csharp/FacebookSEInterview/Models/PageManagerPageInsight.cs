using System.Collections.Generic;

namespace FacebookSEInterview.Models
{
    public class ValueInfo
    {
        public string Value { get; set; }
        public string EndTime { get; set; }
    }

    public class PageManagerPageInsight
    {
        public string Name { get; set; }
        public string Period { get; set; }
        public List<ValueInfo> Values { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Id { get; set; }
    }
}
