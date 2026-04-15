package org.springblade.modules.system.pojo.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

@Data
@TableName("biz_enterprise")
@Schema(description = "Enterprise对象")
public class Enterprise implements Serializable {

	@Serial
	private static final long serialVersionUID = 1L;

	@JsonSerialize(using = ToStringSerializer.class)
	@TableId(value = "enterprise_id", type = IdType.ASSIGN_ID)
	@Schema(description = "企业ID")
	private Long enterpriseId;

	@Schema(description = "租户ID")
	private String tenantId;

	@Schema(description = "企业名称")
	private String enterpriseName;

	@Schema(description = "企业编码")
	private String enterpriseCode;

	@Schema(description = "企业类型")
	private Integer enterpriseType;

	@JsonSerialize(using = ToStringSerializer.class)
	@Schema(description = "主管理员用户ID")
	private Long adminUserId;

	@JsonSerialize(using = ToStringSerializer.class)
	@Schema(description = "创建人")
	private Long createUser;

	@Schema(description = "创建时间")
	private Date createTime;

	@JsonSerialize(using = ToStringSerializer.class)
	@Schema(description = "更新人")
	private Long updateUser;

	@Schema(description = "更新时间")
	private Date updateTime;

	@Schema(description = "状态")
	private Integer status;

	@TableLogic
	@Schema(description = "是否删除")
	private Integer isDeleted;
}
