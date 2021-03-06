import { Button, Col, Row, Space, Typography } from 'antd';
import moment from 'moment';
import React, { FC, useEffect, useState } from 'react';
import { InsaButton } from '..';
import { EBillingPackageType } from '../../api/billing-api';
import icActionsCloseSimple from '../../assets/images/ic-actions-close-simple.svg';
import imageForBuy from '../../assets/images/image-for-buy.svg';
import { checkWarningTrialExpiration } from '../../helper/get-time';
import { useBilling } from '../../pages/setting/create-billing/state/context';
import './banner-notify-package.less';

const { Title } = Typography;

interface Props {
    packageName?: string;
    closeWarning?: Function;
    forTrial?: boolean;
    onAction?: Function;
}

const BannerNotifyPackage: FC<Props> = ({ packageName, closeWarning, forTrial, onAction }) => {
    const { packagesActive } = useBilling();
    const [willExpired, setWillExpired] = useState<boolean>(false);
    const [daysUntilExpiration, setDaysUntilExpiration]= useState<number>();

    useEffect(() => {
        if (forTrial) {
            const packageTrial = packagesActive.find(
                (item) => item.packageType === EBillingPackageType.Trial
            );
            
            if (packageTrial) {
                setWillExpired(checkWarningTrialExpiration(packageTrial.expiredAt));
                setDaysUntilExpiration(Math.round(moment(packageTrial.expiredAt).diff(moment(), 'days', true)));
            };
        } else {
            const isWillExpired = packagesActive.length !== 0;
            setWillExpired(isWillExpired);
        }
}   , [forTrial, packagesActive])

    return (
        <Row className="banner-notify-package" align="middle" justify="center">
            {forTrial ? (
                <>
                    <Col>
                        <img src={imageForBuy} alt="icon" />
                    </Col>
                    <Col>
                        <Title level={4} className="notify-content">
                            { willExpired ?
                                `T??i kho???n d??ng th??? c???a b???n s??? h???t h???n trong ${daysUntilExpiration} ng??y. 
                                Vui l??ng mua g??i d???ch v??? ????? kh??ng b??? gi??n ??o???n` :
                                'T??i kho???n d??ng th??? c???a b???n ???? h???t h???n. Vui l??ng mua g??i d???ch v??? ????? ti???p t???c s??? d???ng'
                            }
                        </Title>
                    </Col>
                    <Col span={1} />
                    <Col>
                        <InsaButton
                            icon={null}
                            type="default"
                            onClick={() => onAction && onAction()}
                        >
                            Xem c??c g??i
                        </InsaButton>
                    </Col>
                    <Button
                        type="text"
                        className="btn-close"
                        onClick={() => closeWarning && closeWarning()}
                    >
                        <img src={icActionsCloseSimple} alt="icon" />
                    </Button>
                </>
            ) : (
                <>
                    <Col>
                        <img src={imageForBuy} alt="icon" />
                    </Col>
                    <Col span={1} />
                    <Col>
                        <Space>
                            <Title level={4}>G??i d???ch v???</Title>
                            <Title level={3}>{packageName}</Title>
                            <Title level={4}>
                                { willExpired ? 'c???a b???n s???p h???t h???n' : 'c???a b???n ???? h???t h???n' }
                            </Title>
                        </Space>
                    </Col>
                    <Col span={1} />
                    <Col>
                        <InsaButton
                            icon={null}
                            type="default"
                            onClick={() => onAction && onAction()}
                        >
                            { willExpired ? 'Gia h???n g??i d???ch v???' : 'Thay ?????i g??i d???ch v???' }
                        </InsaButton>
                    </Col>
                    <Button
                        type="text"
                        className="btn-close"
                        onClick={() => closeWarning && closeWarning()}
                    >
                        <img src={icActionsCloseSimple} alt="icon" />
                    </Button>
                </>
            )}
        </Row>
    );
};

export default BannerNotifyPackage;
