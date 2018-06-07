// @flow
import * as React from 'react'
import { withSelectedPixels } from '../../hoc/withSelectedPixels'
import type { SelectedPixelsProviderState } from '../../stores/SelectedPixelsProvider'
import { SelectedPixel } from '../../models/SelectedPixel'
import { hexPalette } from '../../helpers/colors'
import './styles/SelectedPixelsInfo.css'
import { Row } from 'antd'
import * as pluralize from 'pluralize'
import withModal from '../../hoc/withModal'
import SelectedPixelsModal from '../Modals/SelectedPixelsModal'
import { WithModal } from '../../types/WithModal'
import withWeb3 from '../../hoc/withWeb3'
import { gasCalculator } from '../../helpers/gasCalculator'
import { EthToUsd } from '../Small/EthToUsd'

type Props = {
  canvasId: number,
  isCanvasEmpty: boolean,
  // withModal
  modal: WithModal,
  // withSelectedPixels
  selectedPixelsStore: SelectedPixelsProviderState,
  // withWeb3
  gasPrice: ?number,
  web3: Object,
}

const COLOR_PREVIEW_LIMIT = 19

class SelectedPixelsInfo extends React.PureComponent<Props> {
  static defaultProps = {}

  calculateEstimatedGasPrice = (selectedPixelsCount: number) => {
    if (this.props.gasPrice) {
      const estimatedGasPriceInWei = this.props.gasPrice * gasCalculator.setPixels(selectedPixelsCount, this.props.isCanvasEmpty)
      return parseFloat(this.props.web3.fromWei(estimatedGasPriceInWei, 'ether'))
    }
    return null
  }

  render () {
    const selectedPixels = this.props.selectedPixelsStore.getSelectedPixels(this.props.canvasId)
    const pixelsCutFromPreview = selectedPixels.length - COLOR_PREVIEW_LIMIT

    const estimatedGasPriceInEth = this.calculateEstimatedGasPrice(selectedPixels.length)

    if (!selectedPixels.length) {
      return <p>Click on a pixel to select</p>
    }

    return (
      <div>
        <SelectedPixelsModal
          modal={this.props.modal}
          selectedPixels={selectedPixels}
          removeSelectedPixel={this.props.selectedPixelsStore.removeSelectedPixel}
        />
        <Row type="flex" align="middle" className="SelectedPixelsPreview">
          {selectedPixels.slice(0, COLOR_PREVIEW_LIMIT).map((pixel: SelectedPixel, i: number) =>
            <div className="SelectedPixelsPreview__Color" key={i}
                 style={{ backgroundColor: hexPalette[ pixel.colorId ] }} />
          )}
          {
            pixelsCutFromPreview > 0 && <span>&bull;&bull;&bull; {pixelsCutFromPreview} more</span>
          }
        </Row>
        <p>
          <a href="#" onClick={this.props.modal.show}>
            {selectedPixels.length} {pluralize('pixel', selectedPixels.length)} selected
          </a>
          { this.props.gasPrice && <span>&nbsp;(max. <EthToUsd eth={estimatedGasPriceInEth} />)</span> }
        </p>
      </div>
    )
  }
}

SelectedPixelsInfo = withWeb3(withModal(withSelectedPixels(SelectedPixelsInfo)))
export { SelectedPixelsInfo }
