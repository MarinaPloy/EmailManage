using ManageEmail.Models;
using Oracle.ManagedDataAccess.Client;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;
using TrainingRecord.Common;
using System.Security.Principal;
using System.Runtime.Caching;

namespace ManageEmail.Repositories
{
    public class AllRepo
    {
        public static class EtaxUserRepo
        {
            // simple cache to reduce DB hits (5 minutes)
            private static readonly MemoryCache _cache = MemoryCache.Default;
            private const string CachePrefix = "ETAXUSER_";

            public static bool IsAuthorizedWindowsUser(out EtaxUser user)
            {
                user = null;
                string rawName = HttpContext.Current?.User?.Identity?.Name;
                if (string.IsNullOrWhiteSpace(rawName))
                    rawName = System.Security.Principal.WindowsIdentity.GetCurrent()?.Name;

                if (string.IsNullOrWhiteSpace(rawName))
                    return false;

                string login = rawName;
                if (login.Contains("\\"))
                {
                    var parts = login.Split('\\');
                    if (parts.Length == 2) login = parts[1];
                }
                login = login.Trim();

                string cacheKey = CachePrefix + login.ToUpperInvariant();
                user = _cache.Get(cacheKey) as EtaxUser;
                if (user != null)
                    return true;

                var db = new DBHelpers();
                const string sql = @"
            SELECT user_name, role, status, created_by, created_date, updated_by, updated_date
              FROM COS.ETAX_USER
             WHERE UPPER(user_name) = :USER_NAME";

                var dt = db.ExecuteQuery(sql, new Oracle.ManagedDataAccess.Client.OracleParameter("USER_NAME", login.ToUpperInvariant()));
                //var dt = db.ExecuteQuery(sql, new Oracle.ManagedDataAccess.Client.OracleParameter("USER_NAME", "wewe"));
                if (dt.Rows.Count == 0)
                    return false;

                DataRow r = dt.Rows[0];
                user = new EtaxUser
                {
                    UserName = Convert.ToString(r["USER_NAME"]).Trim(),
                    Role = r.IsNull("ROLE") ? null : Convert.ToString(r["ROLE"]).Trim(),
                    Status = r.IsNull("STATUS") ? null : Convert.ToString(r["STATUS"]).Trim(),
                    CreatedBy = r.IsNull("CREATED_BY") ? null : Convert.ToString(r["CREATED_BY"]).Trim(),
                    CreatedDate = r.IsNull("CREATED_DATE") ? (DateTime?)null : (DateTime)r["CREATED_DATE"],
                    UpdatedBy = r.IsNull("UPDATED_BY") ? null : Convert.ToString(r["UPDATED_BY"]).Trim(),
                    UpdatedDate = r.IsNull("UPDATED_DATE") ? (DateTime?)null : (DateTime)r["UPDATED_DATE"]
                };

                // Rule: presence in table is enough. If you want status filtering later, add: if (!string.Equals(user.Status,"ACTIVE",StringComparison.OrdinalIgnoreCase)) return false;
                _cache.Set(cacheKey, user, DateTimeOffset.UtcNow.AddMinutes(5));
                return true;
            }
        }
        public static List<EtaxBossCustomer> GetCustomers(Filtersearch f)
        {
            int page = int.TryParse(f.page, out var p) ? Math.Max(1, p) : 1;
            int pageSize = int.TryParse(f.page_size, out var ps) ? (ps > 0 ? ps : 10) : 10;

            string[] allowedSortColumns = {
                "CUSTOMER_NUMBER","SITE_NUMBER","CUSTOMER_NAME","CITY","POSTAL_CODE","BRANCH"
            };

            var whereParts = new List<string>();
            if (f.Cnum > 0)
                whereParts.Add("REGEXP_LIKE(TO_CHAR(CUSTOMER_NUMBER), " + f.Cnum + ")");
            if (f.Snum > 0)
                whereParts.Add("REGEXP_LIKE(TO_CHAR(SITE_NUMBER), " + f.Snum + ")");
            if (f.Cname != null)
                whereParts.Add("REGEXP_LIKE(CUSTOMER_NAME, '" + f.Cname + "','i')");

            string whereClause = whereParts.Count > 0 ? "WHERE " + string.Join(" AND ", whereParts) : "";

            string query =
                "SELECT * FROM ( " +
                "  SELECT ROW_NUMBER() OVER (ORDER BY " + f.order + ") AS ROW_NUM, " +
                "         COUNT(*) OVER () AS TOTAL, " +
                "         CUSTOMER_NUMBER, SITE_NUMBER, CUSTOMER_NAME, " +
                "         ADDRESS1, ADDRESS2, ADDRESS3, ADDRESS4, CITY, POSTAL_CODE , COMPANY, BRANCH, " +
                "         (SELECT COUNT(*) FROM COS.ETAX_CONTACT_EMAIL e WHERE e.CUST_NUMBER = c.CUSTOMER_NUMBER AND e.SITE_NUMBER = c.SITE_NUMBER) AS HAVE_EMAIL " +
                "  FROM COS.ETAX_BOSS_CUSTOMER c " +
                "  " + whereClause + " " +
                ") " +
                "WHERE ROW_NUM BETWEEN ((" + page + " - 1) * " + pageSize + " + 1) AND (" + page + " * " + pageSize + ") " +
                "ORDER BY ROW_NUM ";

            DBHelpers con = new DBHelpers();
            DataTable dt = con.ExecuteQuery(query);

            var list = new List<EtaxBossCustomer>();
            foreach (DataRow row in dt.Rows)
            {
                string GetString(string col) => row.IsNull(col) ? string.Empty : Convert.ToString(row[col]).Trim();
                int GetInt(string col) => row.IsNull(col) ? 0 : Convert.ToInt32(row[col]);

                list.Add(new EtaxBossCustomer
                {
                    customer_number = GetInt("CUSTOMER_NUMBER"),
                    site_number = GetInt("SITE_NUMBER"),
                    customer_name = GetString("CUSTOMER_NAME"),
                    address1 = GetString("ADDRESS1"),
                    address2 = GetString("ADDRESS2"),
                    address3 = GetString("ADDRESS3"),
                    address4 = GetString("ADDRESS4"),
                    city = GetString("CITY"),
                    postal_code = GetString("POSTAL_CODE"),
                    Total = GetInt("TOTAL"),
                    ROW_NUM = GetInt("ROW_NUM"),
                    PageNum = page,
                    PageSize = pageSize,
                    COMPANY = GetString("COMPANY"),
                    BRANCH = GetString("BRANCH"),
                    HaveEmail = GetInt("HAVE_EMAIL")
                });
            }
            return list;
        }

        public static List<EtaxContactEmail> GetEmails(Filtersearch f)
        {
            int page = int.TryParse(f.page, out var p) ? Math.Max(1, p) : 1;
            int pageSize = int.TryParse(f.page_size, out var ps) ? (ps > 0 ? ps : 10) : 10;

            string[] allowedSortColumns = {
                "CON_RECID","CUST_NUMBER","SITE_NUMBER","EMAIL_TAXINV","CREATED_BY","CREATED_DATE","CHANGED_BY","CHANGED_DATE"
            };


            var whereParts = new List<string>();
            if (f.Cnum > 0)
                whereParts.Add("REGEXP_LIKE(TO_CHAR(CUST_NUMBER), " + f.Cnum + ")");
            if (f.Snum > 0)
                whereParts.Add("REGEXP_LIKE(TO_CHAR(SITE_NUMBER), " + f.Snum + ")");
            string whereClause = whereParts.Count > 0 ? "WHERE " + string.Join(" AND ", whereParts) : "";

            string query =
                "SELECT * FROM ( " +
                "  SELECT ROW_NUMBER() OVER (ORDER BY " + f.order + ") AS ROW_NUM, " +
                "         COUNT(*) OVER () AS TOTAL, " +
                "         CON_RECID, CUST_NUMBER, SITE_NUMBER, EMAIL_TAXINV, CREATED_BY, CREATED_DATE, CHANGED_BY, CHANGED_DATE " +
                "  FROM COS.ETAX_CONTACT_EMAIL " +
                "  " + whereClause + " " +
                ") " +
                "WHERE ROW_NUM BETWEEN ((" + page + " - 1) * " + pageSize + " + 1) AND (" + page + " * " + pageSize + ") " +
                "ORDER BY ROW_NUM";

            DBHelpers con = new DBHelpers();
            DataTable dt = con.ExecuteQuery(query);
            var list = new List<EtaxContactEmail>();

            foreach (DataRow row in dt.Rows)
            {
                string GetString(string col) => row.IsNull(col) ? string.Empty : Convert.ToString(row[col]).Trim();
                string GetDate(string col) => row.IsNull(col) ? string.Empty : ((DateTime)row[col]).ToString("dd/MM/yyyy");
                int GetInt(string col) => row.IsNull(col) ? 0 : Convert.ToInt32(row[col]);

                list.Add(new EtaxContactEmail
                {
                    CON_RECID = GetInt("CON_RECID"),
                    cust_number = GetInt("CUST_NUMBER"),
                    site_number = GetInt("SITE_NUMBER"),
                    email_taxinv = GetString("EMAIL_TAXINV"),
                    created_by = GetString("CREATED_BY"),
                    created_date = GetDate("CREATED_DATE"),
                    changed_by = GetString("CHANGED_BY"),
                    changed_date = GetDate("CHANGED_DATE"),
                    Total = GetInt("TOTAL"),
                    ROW_NUM = GetInt("ROW_NUM"),
                    PageNum = page,
                    PageSize = pageSize
                });
            }
            return list;
        }

        public abstract class EtaxContactEmailCommand
        {
            protected readonly DBHelpers _db = new DBHelpers();
            protected const int UserColumnMaxLength = 20;

            protected static OracleParameter P(string name, object value) =>
                new OracleParameter(name, value ?? DBNull.Value);

            protected static string ResolveCurrentUser()
            {
                string name = HttpContext.Current?.User?.Identity?.Name;
                if (string.IsNullOrWhiteSpace(name))
                    name = WindowsIdentity.GetCurrent()?.Name;
                if (string.IsNullOrWhiteSpace(name))
                    name = "SYSTEM";
                if (name.Contains("\\"))
                {
                    var parts = name.Split('\\');
                    if (parts.Length == 2 && !string.IsNullOrWhiteSpace(parts[1]))
                        name = parts[1];
                }
                name = name.Trim();
                if (name.Length > UserColumnMaxLength)
                    name = name.Substring(0, UserColumnMaxLength);
                return name;
            }
        }

        // ADD (ไม่ต้องใช้ CON_RECID ตอนส่ง เข้าใจว่าเป็น Identity / Sequence & Trigger)
        public class AddEtaxContactEmail : EtaxContactEmailCommand
        {
            private readonly EtaxContactEmail _model;
            public AddEtaxContactEmail(EtaxContactEmail model) { _model = model; }

            public int Execute()
            {
                ValidateForAdd(_model);
                string user = ResolveCurrentUser();

                const string sql = @"
                    INSERT INTO COS.ETAX_CONTACT_EMAIL
                        (CUST_NUMBER, SITE_NUMBER, EMAIL_TAXINV, CREATED_BY, CREATED_DATE)
                    VALUES
                        (:CUST_NUMBER, :SITE_NUMBER, :EMAIL_TAXINV, :CREATED_BY, SYSDATE)";

                return _db.ExecuteNonQuery(sql,
                    P("CUST_NUMBER", _model.cust_number),
                    P("SITE_NUMBER", _model.site_number),
                    P("EMAIL_TAXINV", _model.email_taxinv),
                    P("CREATED_BY", user)
                );
            }

            private void ValidateForAdd(EtaxContactEmail m)
            {
                if (m == null) throw new ArgumentNullException(nameof(m));
                if (m.cust_number <= 0) throw new ArgumentException("cust_number required");
                if (m.site_number <= 0) throw new ArgumentException("site_number required");
                if (string.IsNullOrWhiteSpace(m.email_taxinv)) throw new ArgumentException("email_taxinv required");

                m.email_taxinv = m.email_taxinv.Replace(';', ',');
                var emails = m.email_taxinv
                    .Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries)
                    .Select(e => e.Trim())
                    .Where(e => e.Length > 0)
                    .ToList();
                if (emails.Count == 0) throw new ArgumentException("At least one email required");
                foreach (var e in emails)
                    if (!e.Contains("@"))
                        throw new ArgumentException("Invalid email format: " + e);
                m.email_taxinv = string.Join(",", emails);
            }
        }

        // EDIT ใช้ WHERE CON_RECID
        public class EditEtaxContactEmail : EtaxContactEmailCommand
        {
            private readonly EtaxContactEmail _model;
            public EditEtaxContactEmail(EtaxContactEmail model) { _model = model; }

            public int Execute()
            {
                ValidateForEdit(_model);
                string user = ResolveCurrentUser();

                const string sql = @"
                    UPDATE COS.ETAX_CONTACT_EMAIL
                       SET EMAIL_TAXINV = :EMAIL_TAXINV,
                           CHANGED_BY   = :CHANGED_BY,
                           CHANGED_DATE = SYSDATE
                     WHERE CON_RECID   = :CON_RECID";

                return _db.ExecuteNonQuery(sql,
                    P("EMAIL_TAXINV", _model.email_taxinv),
                    P("CHANGED_BY", user),
                    P("CON_RECID", _model.CON_RECID)
                );
            }

            private void ValidateForEdit(EtaxContactEmail m)
            {
                if (m == null) throw new ArgumentNullException(nameof(m));
                if (m.CON_RECID <= 0) throw new ArgumentException("CON_RECID required");
                if (string.IsNullOrWhiteSpace(m.email_taxinv)) throw new ArgumentException("email_taxinv required");

                m.email_taxinv = m.email_taxinv.Replace(';', ',');
                var emails = m.email_taxinv
                    .Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries)
                    .Select(e => e.Trim())
                    .Where(e => e.Length > 0)
                    .ToList();
                if (emails.Count == 0) throw new ArgumentException("At least one email required");
                foreach (var e in emails)
                    if (!e.Contains("@"))
                        throw new ArgumentException("Invalid email format: " + e);
                m.email_taxinv = string.Join(",", emails);
            }
        }

        // DELETE ใช้ WHERE CON_RECID
        public class DeleteEtaxContactEmail : EtaxContactEmailCommand
        {
            private readonly int _recid;
            public DeleteEtaxContactEmail(int recid) { _recid = recid; }

            public int Execute()
            {
                ValidateForDelete();
                const string sql = @"
                    DELETE FROM COS.ETAX_CONTACT_EMAIL
                     WHERE CON_RECID = :CON_RECID";

                return _db.ExecuteNonQuery(sql,
                    P("CON_RECID", _recid)
                );
            }

            private void ValidateForDelete()
            {
                if (_recid <= 0) throw new ArgumentException("CON_RECID required");
            }
        }
    }
}