import { SearchOutlined } from '@ant-design/icons';
import { Checkbox, Divider, Input, Modal, Space } from 'antd';
import { CheckboxOptionType, CheckboxValueType } from 'antd/lib/checkbox/Group';
import React, { FC, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { InsaButton } from '../../../../components';
import { IWarehouse } from '../../../../models';
import { IState } from '../../../../store/rootReducer';
import { useWarehouses } from './hooks/warehouses';

const SelectWarehouse: FC = () => {
    const [visible, setVisible] = useState<boolean>(false);
    const [localWarehouseIds, setLocalWarehouseIds] = useState<string[]>([]);
    const [searchText, setSearchText] = useState<string>();
    const { warehouses, selectWarehouses } = useWarehouses();

    const warehouseOptions = useSelector((state: IState) => state.store.warehouses);

    useEffect(() => {
        setLocalWarehouseIds(warehouses.map((item: IWarehouse) => item._id as string));
    }, [warehouses]);

    const toggle = () => setVisible(!visible);

    const checkboxOptions: CheckboxOptionType[] = useMemo(() => {
        return warehouseOptions
            .filter((item: IWarehouse) =>
                searchText
                    ? (item.name as string)
                          .toLowerCase()
                          .trim()
                          .includes(searchText?.toLowerCase().trim())
                    : true
            )
            .map((item: IWarehouse) => ({
                label: <>{item.name}</>,
                value: item._id as string,
            }));
    }, [warehouseOptions, searchText]);

    const onChange = (checkedValue: CheckboxValueType[]) => {
        setLocalWarehouseIds(checkedValue as string[]);
    };

    const handleCancel = () => {
        setLocalWarehouseIds(warehouses.map((item: IWarehouse) => item._id as string));
        toggle();
    };

    const handleSubmit = () => {
        selectWarehouses(localWarehouseIds);
        toggle();
    };

    const handleSearchTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(event.target.value);
    };

    return (
        <>
            <InsaButton onClick={toggle}>
                <span>T??y ch???nh kho</span>
            </InsaButton>

            <Modal
                visible={visible}
                onCancel={handleCancel}
                title="T??y ch???nh kho h??ng"
                footer={null}
                wrapClassName="modal-select-warehouse"
                closable={false}
            >
                <div>
                    <Input
                        placeholder="T??m kho h??ng"
                        prefix={<SearchOutlined />}
                        width={'100%'}
                        value={searchText}
                        onChange={handleSearchTextChange}
                    />
                </div>

                <div className="checkbox-group-label">
                    Ch???n ?????a ch??? t???n kho cho s???n ph???m ch??? ?????nh
                </div>

                <Checkbox.Group
                    options={checkboxOptions}
                    value={localWarehouseIds}
                    onChange={onChange}
                />

                <Divider />

                <Space className="footer">
                    <InsaButton onClick={handleCancel} size="middle" style={{ width: 120 }}>
                        H???y
                    </InsaButton>
                    <InsaButton
                        onClick={handleSubmit}
                        type="primary"
                        size="middle"
                        style={{ width: 120 }}
                    >
                        C???p nh???t
                    </InsaButton>
                </Space>
            </Modal>
        </>
    );
};

export default SelectWarehouse;
