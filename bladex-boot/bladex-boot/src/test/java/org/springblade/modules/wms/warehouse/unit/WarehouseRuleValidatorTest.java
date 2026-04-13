package org.springblade.modules.wms.warehouse.unit;

import org.junit.jupiter.api.Test;
import org.springblade.core.log.exception.ServiceException;
import org.springblade.modules.wms.warehouse.pojo.dto.WarehouseSubmitDTO;
import org.springblade.modules.wms.warehouse.service.impl.WarehouseRuleValidator;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class WarehouseRuleValidatorTest {

	@Test
	void shouldRejectMissingRequiredFields() {
		WarehouseSubmitDTO dto = new WarehouseSubmitDTO();

		ServiceException meterError = assertThrows(ServiceException.class, () -> WarehouseRuleValidator.validateSubmit(dto));
		assertEquals("表具档案不能为空", meterError.getMessage());

		dto.setMeterId(1L);
		ServiceException imeiError = assertThrows(ServiceException.class, () -> WarehouseRuleValidator.validateSubmit(dto));
		assertEquals("IMEI 不能为空", imeiError.getMessage());

		dto.setImei("861234567890121");
		ServiceException protocolError = assertThrows(ServiceException.class, () -> WarehouseRuleValidator.validateSubmit(dto));
		assertEquals("通讯协议不能为空", protocolError.getMessage());
	}

	@Test
	void shouldRejectInvalidImei() {
		WarehouseSubmitDTO dto = new WarehouseSubmitDTO();
		dto.setMeterId(1L);
		dto.setImei("123");
		dto.setProtocolType(0);

		ServiceException error = assertThrows(ServiceException.class, () -> WarehouseRuleValidator.validateSubmit(dto));
		assertEquals("IMEI 必须为15位数字", error.getMessage());
	}

	@Test
	void shouldRejectInvalidCarrierCode() {
		WarehouseSubmitDTO dto = new WarehouseSubmitDTO();
		dto.setMeterId(1L);
		dto.setImei("861234567890121");
		dto.setProtocolType(0);
		dto.setCarrier(9);

		ServiceException error = assertThrows(ServiceException.class, () -> WarehouseRuleValidator.validateSubmit(dto));
		assertEquals("运营商不存在", error.getMessage());
	}

	@Test
	void shouldAcceptValidPayload() {
		WarehouseSubmitDTO dto = new WarehouseSubmitDTO();
		dto.setMeterId(1L);
		dto.setPrepId(2L);
		dto.setImei("861234567890121");
		dto.setProtocolType(0);
		dto.setCarrier(1);
		dto.setVendorCode("NB-001");
		dto.setRemark("ok");

		assertDoesNotThrow(() -> WarehouseRuleValidator.validateSubmit(dto));
	}
}
