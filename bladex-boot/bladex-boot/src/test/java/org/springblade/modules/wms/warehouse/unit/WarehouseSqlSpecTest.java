package org.springblade.modules.wms.warehouse.unit;

import org.junit.jupiter.api.Test;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertTrue;

class WarehouseSqlSpecTest {

	@Test
	void warehouseUpgradeScriptsShouldExist() {
		assertTrue(Files.exists(Path.of("doc/sql/upgrade/water-dev.mysql.warehouse-management.sql")),
			"warehouse management upgrade sql should exist");
		assertTrue(Files.exists(Path.of("doc/sql/upgrade/water-dev.mysql.warehouse-meter-latest.sql")),
			"warehouse meter latest sql should exist");
	}
}
