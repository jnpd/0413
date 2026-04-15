package org.springblade.modules.system.pojo.vo;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springblade.modules.system.pojo.entity.Enterprise;

import java.io.Serial;

@Data
@EqualsAndHashCode(callSuper = true)
@Schema(description = "EnterpriseVO对象")
public class EnterpriseVO extends Enterprise {

	@Serial
	private static final long serialVersionUID = 1L;

	@JsonSerialize(using = ToStringSerializer.class)
	@Schema(description = "企业ID")
	private Long enterpriseId;

	@JsonSerialize(using = ToStringSerializer.class)
	@Schema(description = "主管理员用户ID")
	private Long adminUserId;

	@Schema(description = "关键字")
	private String keyword;

	@Schema(description = "管理员姓名")
	private String adminName;

	@Schema(description = "登录账号")
	private String loginAccount;
}
