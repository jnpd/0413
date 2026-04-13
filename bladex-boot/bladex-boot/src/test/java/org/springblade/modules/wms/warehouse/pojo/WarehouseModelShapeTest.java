package org.springblade.modules.wms.warehouse.pojo;

import org.junit.jupiter.api.Test;
import org.springblade.modules.wms.warehouse.pojo.dto.WarehouseSubmitDTO;
import org.springblade.modules.wms.warehouse.pojo.vo.WarehousePageVO;
import org.springblade.modules.wms.warehouse.pojo.vo.WarehouseStatsVO;

import java.lang.reflect.Field;
import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertTrue;

class WarehouseModelShapeTest {

	@Test
	void submitDtoShouldExposeEditableFields() {
		Set<String> fieldNames = fieldNames(WarehouseSubmitDTO.class);
		assertTrue(fieldNames.containsAll(Arrays.asList(
			"deviceId",
			"meterId",
			"prepId",
			"imei",
			"protocolType",
			"carrier",
			"vendorCode",
			"remark"
		)));
	}

	@Test
	void statsVoShouldExposeCardFields() {
		Set<String> fieldNames = fieldNames(WarehouseStatsVO.class);
		assertTrue(fieldNames.containsAll(Arrays.asList(
			"inStockCount",
			"outboundCount",
			"pendingCount",
			"passedCount",
			"failedCount"
		)));
	}

	@Test
	void pageVoShouldExposeListFieldsUsedByWarehousePage() {
		Set<String> fieldNames = fieldNames(WarehousePageVO.class);
		assertTrue(fieldNames.containsAll(Arrays.asList(
			"deviceId",
			"meterId",
			"imei",
			"meterNo",
			"inboundTime",
			"forwardTotalFlow",
			"reverseTotalFlow",
			"prepId",
			"prepNo",
			"mainIp",
			"backupIp",
			"meterName",
			"meterModel",
			"meterCaliber",
			"protocolType",
			"protocolTypeName",
			"carrier",
			"carrierName",
			"valveStatus",
			"batteryVoltage",
			"boxNo",
			"vendorCode",
			"iccid",
			"csq",
			"rsrp",
			"rsrq",
			"stockStatus",
			"testStatus",
			"outboundTime",
			"outboundOperatorName",
			"remark",
			"updateTime"
		)));
	}

	private Set<String> fieldNames(Class<?> type) {
		return Arrays.stream(type.getDeclaredFields())
			.map(Field::getName)
			.collect(Collectors.toSet());
	}
}
